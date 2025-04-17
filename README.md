# Three.js FBX Viewer

Prosty projekt webowy wyświetlający plik FBX za pomocą Three.js i FBXLoader.

## Uruchomienie lokalne

W katalogu projektu uruchom serwer HTTP i otwórz w przeglądarce:

```bash
# Python 3
python -m http.server 8000

# lub Node.js
npx serve .
```

Następnie przejdź pod adres `http://localhost:8000`.

## Deployment na GitHub Pages

Automatyczne wdrożenie jest skonfigurowane za pomocą GitHub Actions. Po każdej zmianie w branchu `main` workflow zbuduje i opublikuje stronę.

Adres będzie:
`https://konradmbones.github.io/three-fbx/`

Jeśli to pierwsze wdrożenie, upewnij się w **Settings > Pages**, że źródło to **GitHub Actions**.

## Struktura plików

- `index.html` — ładuje Three.js, FBXLoader, inituje scenę
- `workshop_01_001.fbx` — plik modelu FBX
- `.github/workflows/deploy.yml` — workflow CI do GitHub Pages
