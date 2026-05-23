# shopping-listapp

한국어 쇼핑 리스트 웹 앱 (HTML + Supabase)

## 기술 스택

- Vanilla JS + HTML/CSS (빌드 도구 없음)
- [Supabase](https://supabase.com) — 데이터 저장 및 실시간 동기화

## 실행 방법

`index.html`을 브라우저에서 직접 열거나 로컬 서버로 서빙합니다.

```bash
python3 -m http.server 8080
```

## 주요 기능

- 아이템 추가 / 삭제
- 완료 체크 및 일괄 삭제
- Supabase DB 연동으로 새로고침 후에도 데이터 유지
