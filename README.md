# 폐장 후, 우리

주식 시장이 닫힌 뒤 시작되는 관계 중심의 Twine/SugarCube 스토리 게임입니다.

## 작업 방식

- 이야기: `src/**/*.twee`
- 공통 스타일: `src/styles/story.css`
- 공통 스크립트: `src/scripts/setup.js`
- 기존 게임에서 가져온 이미지: `assets/images/`
- 빌드 결과: `build/index.html`

VS Code에서 `Ctrl+Shift+B`를 누르면 기본 빌드 작업이 실행됩니다. 명령 팔레트의 `Tasks: Run Task`에서는 자동 감시와 빌드 후 미리보기도 선택할 수 있습니다.

## 직접 빌드

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\build.ps1
```

자동 감시:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\build.ps1 -Watch
```

이미지 파일은 저장소 크기를 줄이기 위해 Git LFS로 관리합니다. 새 환경에서는 `git lfs install`이 필요합니다.

