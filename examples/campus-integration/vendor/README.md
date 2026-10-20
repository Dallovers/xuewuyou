# vendor

`three.module.js`（Three.js 0.170.0）是**可选**文件：

- **放进来**：`host.js` 从本地加载，完全离线；
- **没放**：`host.js` 自动回退到 CDN `https://unpkg.com/three@0.170.0/build/three.module.js`。

想离线时，把下面这个文件另存为 `three.module.js` 放在本目录即可（约 1.3 MB）：

```
https://unpkg.com/three@0.170.0/build/three.module.js
```

许可证见 `THREE-LICENSE.txt`。
