# opi-sem4-lab3-frontend

Forked from ssnagin/web-sem3-lab4-frontend

```
se-itmo-labs.github.io/opi-sem4-lab3-frontend/
```

## Инфа по алгоритму сжатия

Oxc Minifier -- написан на Rust.

Из доступных -- terser, esbuild (устарел)

## Инфа про source map

Generate production source maps. If true, a separate sourcemap file will be created. If 'inline', the sourcemap will be appended to the resulting output file as a data URI. 'hidden' works like true except that the corresponding sourcemap comments in the bundled files are suppressed.

```json
{
    "version":3,
    "file":"index.js",
    "sourceRoot":"",
    "sources":["../src/index.ts"],
    "names":[],
    "mappings":"AAAA,OAAO,EAAE,QAAQ,EAAE,MAAM,aAAa,CAAC;AAEvC,SAAS,SAAS;IACd,MAAM,OAAO,GAAG,QAAQ,CAAC,aAAa,CAAC,KAAK,CAAC,CAAC;",
    "sourcesContent": []
}

```

https://habr.com/ru/articles/509250/

