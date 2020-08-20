---
title: FyzX Simulation Language Syntax Draft
author: Vít Falta
---

1.

```
cislo = 1

while(cislo < 6){
  print(cislo)

  cislo = cislo + 1
}

print(cislo * 2)
```

2.

```
cislo = 3

while cislo < 8 {
  print(cislo)

  cislo = cislo + 1
}

print(cislo * 2.5)
```

3.

```
cislo = 6

while cislo > 0 then
  print(cislo)

  cislo = cislo - 1
end

print(2)
```

4.

```
cislo = 1

dokud(cislo < 6) {
  vypis(cislo)

  cislo = cislo + 1
}

vypis(cislo)
```

5.

```
cislo = 1

dokud cislo < 6 {
  vypis(cislo)

  cislo = cislo + 1
}

vypis(cislo)
```

6.

```
cislo = 1

dokud cislo < 6 tak
  vypis(cislo)

  cislo = cislo + 1
konec

vypis(cislo)
```
