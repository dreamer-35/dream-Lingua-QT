# 角色素材说明

## 文件说明

- `character.png` - 默认角色图片(可替换为你喜欢的动漫角色)
- 建议尺寸: 200x200 或 400x400 像素
- 支持透明背景 PNG 格式

## 如何替换角色

1. 准备一张透明背景的动漫角色图片
2. 重命名为 `character.png`
3. 放置到此目录
4. 重启应用即可

## Live2D 模型

如果你有 Live2D 模型,请将模型文件放到 `../live2d/` 目录下,然后:

1. 确保有以下文件:
   - `model.json` (模型配置文件)
   - `*.moc3` (模型文件)
   - `*.png` (纹理文件)
   - `*.motion3.json` (动作文件,可选)

2. 在 `popup.html` 中启用 Live2D 支持

## 推荐资源

- Live2D 官方示例: https://www.live2d.com/
- 免费角色素材: https://www.pixiv.net/
- 透明背景处理: https://www.remove.bg/

