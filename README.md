# GLSL with openFrameworks
シンプルなDomain WarpingをopenFrameworksに移植するサンプル。

openFrameworksの`apps/myApps`以下にこのディレクトリが存在することを前提とする。

## Usage
テクスチャ画像はGit管理下に入れていないので、`bin/data`以下に`pen_1.jpg`を手動で配置する。

## 注意点
テクスチャの画素数が2の累乗ではない場合、`ofApp.cpp`の`ofApp::setup()`には`ofDisableArbTex();`を記載せず、Fragment Shaderでも`sampler2D`, `texture2D`の代わりに`sampler2DRect`, `texture2DRect`を使用すれば良いらしい。
ただし、その場合は以下の2点に注意が必要。

- テクスチャ座標が0から1ではなくピクセル単位（テクスチャの画素に対応）になる
- `ofApp::setup()`に`image.getTexture().setTextureWrap(GL_REPEAT, GL_REPEAT);`を記載しても`GL_REPEAT`が有効にならない

後者に関しては、`test.frag`に実装した`mirror()`関数を利用することで対処した。
