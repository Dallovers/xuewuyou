"""Fixed JSON protocol: CP-SAT scheduling and fixed-parameter pyBKT inference.
No uploaded Python code is executed by this process.
"""
import sys
import json
import contextlib

PARAMS = dict(prior=0.2, learns=0.1, forgets=0.0, guesses=0.25, slips=0.1)


def mastery(data):
    import numpy as np
    import pandas as pd
    from pyBKT.models import Model
    observations = data.get('observations', [])
    skills = sorted(set(o['topic'] for o in observations))
    if not skills:
        return dict(engine='pyBKT', parameters=PARAMS, topics={}, mode='fixed-parameter', count=0)
    rows = []
    for skill in skills:
        seq = [o for o in observations if o['topic'] == skill]
        for i, o in enumerate(seq):
            rows.append(dict(user_id='learner', skill_name=skill, correct=int(o['correct']), order_id=i))
        # A missing-response probe exposes state AFTER all observed answers.
        rows.append(dict(user_id='learner', skill_name=skill, correct=-1, order_id=len(seq)))
    model = Model(seed=42)
    model.coef_ = {skill: {k: v if k == 'prior' else np.array([v]) for k, v in PARAMS.items()} for skill in skills}
    frame = pd.DataFrame(rows)
    # Build library metadata without training parameters on sparse personal data.
    model.fit(data=frame, skills=skills, preload=True)
    # pyBKT 1.4.3 preload reconstructs prior/learns from its random internal
    # matrices. Set the public inference parameters AFTER metadata creation.
    # predict_onestep and its E-step both consume these parameter fields.
    for skill in skills:
        model.fit_model[skill].update({k: v if k == 'prior' else np.array([v]) for k, v in PARAMS.items()})
    predicted = model.predict(data=frame)
    topics = {}
    for skill in skills:
        seq = [o for o in observations if o['topic'] == skill]
        p = predicted[predicted.skill_name == skill].iloc[-1]
        topics[skill] = dict(mastery=float(p.state_predictions), nextCorrect=float(p.correct_predictions), observations=len(seq), correct=sum(o['correct'] for o in seq), lastAt=seq[-1]['at'])
    return dict(engine='pyBKT', parameters=PARAMS, topics=topics, mode='fixed-parameter', count=len(observations))


def schedule(data):
    from ortools.sat.python import cp_model
    model = cp_model.CpModel()
    tasks, slots = data['tasks'], data['slots']
    assignments = {}
    for i, task in enumerate(tasks):
        for j, slot in enumerate(slots):
            assignments[i, j] = model.new_bool_var(f't{i}s{j}')
        model.add(sum(assignments[i, j] for j in range(len(slots))) <= 1)
    for j in range(len(slots)):
        model.add(sum(assignments[i, j] for i in range(len(tasks))) <= 1)
    # If two prerequisite practice topics both fit, put the prerequisite first.
    topic_index = {t['topic']: i for i, t in enumerate(tasks) if t.get('label') == '专项练习'}
    for source, target in data.get('edges', []):
        if source not in topic_index or target not in topic_index:
            continue
        a, b = topic_index[source], topic_index[target]
        chosen_a, chosen_b = model.new_bool_var('a_'+str(a)+'_'+str(b)), model.new_bool_var('b_'+str(a)+'_'+str(b))
        model.add(chosen_a == sum(assignments[a, j] for j in range(len(slots))))
        model.add(chosen_b == sum(assignments[b, j] for j in range(len(slots))))
        model.add(sum(j*assignments[a,j] for j in range(len(slots))) < sum(j*assignments[b,j] for j in range(len(slots)))).only_enforce_if([chosen_a, chosen_b])
    # Reward urgency first, then earlier slots; no promise that every task fits.
    model.maximize(sum((t['priority'] * 10000 + len(slots) - j) * assignments[i, j] for i, t in enumerate(tasks) for j in range(len(slots))))
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5
    solver.parameters.num_search_workers = 1
    solver.parameters.random_seed = 42
    status = solver.solve(model)
    feasible = status in (cp_model.OPTIMAL, cp_model.FEASIBLE)
    planned, remaining = [], []
    for i, task in enumerate(tasks):
        selected = next((j for j in range(len(slots)) if feasible and solver.value(assignments[i, j])), None)
        if selected is None:
            remaining.append(task)
        else:
            planned.append(dict(**task, **slots[selected], done=False))
    planned.sort(key=lambda t: t['start'])
    return dict(engine='OR-Tools CP-SAT', status=solver.status_name(status), scheduled=planned, unscheduled=remaining, durationMinutes=20, breakMinutes=5)


def main():
    data = json.load(sys.stdin)
    with contextlib.redirect_stdout(sys.stderr):
        if data['action'] == 'mastery':
            result = mastery(data)
        elif data['action'] == 'schedule':
            result = schedule(data)
        elif data['action'] == 'health':
            import ortools
            import pyBKT
            from pyBKT.models import Model
            result = dict(ortools=ortools.__version__, pyBKT='1.4.3')
        else:
            raise ValueError('Unknown action')
    sys.stdout.write(json.dumps(result, ensure_ascii=False, allow_nan=False))


if __name__ == '__main__':
    main()
