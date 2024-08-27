1、项目目录（感觉基本上是项目的第一步）

```txt
-- bin -> 指向可执行文件的目录，通常包含命令行工具。
-- doc -> 指向文档文件的目录，通常包含项目的文档。
-- lib -> 指向包含自定义的库文件的目录。
-- public -> 客户端的静态文件
-- test -> 指向测试文件的目录，通常包含测试用例。
```

2、镜像设置

C:\Users\29580 下的 .npmrc 文件中进行配置

prefix 和 cached 键似乎不应该使用

配置 registry=http://registry.npmmirror.com 即可

注意：npm 没有指明 -g 肯定是在当前目录生成 node_modules，出问题就代表配置有问题！

3、