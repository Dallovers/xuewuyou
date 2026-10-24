import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url),sources=JSON.parse(await readFile(new URL('docs/characters/sources.json',root),'utf8'));
const folder='examples/campus-3d-v5/assets/characters/';
const legacy=[
 ['anime','校园同学','student-anime.vrm','vrm'],['robot','校园机器人','student-robot.glb','robot'],
 ['formal','日常学生','student-formal.glb','formal'],['prototype','连帽衫同学','student-hoodie.glb','prototype']
].map(([id,name,file,rig])=>({id,name,price:0,style:'初始形象',rig,model:folder+file,height:1.72,thumbnail:'js/features/campus-hub/assets/skins/'+id+'.webp',author:'详见项目原人物授权',credit:'原校园形象',starter:true}));
const prices={'kaykit-knight':80,'kaykit-mage':80,'kaykit-rogue':80,'kaykit-barbarian':80,'kaykit-skeleton-minion':60,'kenney-female-a':40,'kenney-male-c':40,'kenney-ghost':0,'kenney-vampire':60,fox:60,'vroid-vivi':120,'vroid-vita':160,'vroid-victoria':160,'vroid-fumiriya':120};
const clips={
 kaykit:{idle:'Idle',walk:'Walking_A',run:'Running_A',jump:'Jump_Full_Short',wave:'Cheer',punch:'Unarmed_Melee_Attack_Punch_A'},
 kenney:{idle:'idle',walk:'walk',run:'sprint',jump:'jump',wave:'interact-right',punch:'attack-melee-right'},
 fox:{idle:'Survey',walk:'Walk',run:'Run'}
};
const skins=sources.map(source=>{
 const rig=source.id.startsWith('vroid-')?'vrm0':source.id.startsWith('kaykit-')?'kaykit':source.id.startsWith('kenney-')?'kenney':'fox';
 if(!Number.isInteger(prices[source.id]))throw Error('Missing price '+source.id);
 if(clips[rig])for(const name of Object.values(clips[rig]))if(!source.animations.some(clip=>clip.name===name))throw Error('Missing native clip '+source.id+': '+name);
 return{id:source.id,name:source.displayName,price:prices[source.id],style:source.style,rig,model:rig==='vrm0'?source.modelPath.replace('model.vrm','runtime.vrm'):source.modelPath,
  thumbnail:'js/features/campus-hub/assets/skins/'+source.id+'.webp',
  height:source.id==='fox'?.75:source.id==='kenney-ghost'?1.35:1.72,clips:clips[rig]||null,
  greeting:rig==='kaykit'?'欢呼':'打招呼',author:source.author,license:source.license,
  credit:source.attribution,source:source.sourceUrl,licenseFile:source.licensePath,
  starter:prices[source.id]===0};
});
const catalog={version:1,currency:'学习币',rewardPerQuestion:10,dailyRewardLimit:200,skins:[...legacy,...skins]};
await writeFile(new URL('server/campus/skin-catalog.json',root),JSON.stringify(catalog,null,2)+'\n');
console.log('Campus skin catalog:',catalog.skins.length,'skins;',catalog.skins.filter(s=>s.starter).length,'starter skins');
