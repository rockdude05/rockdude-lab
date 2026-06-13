// vitest(node 환경)용 "server-only" 스텁 — Next.js는 런타임에 이 패키지로 서버 전용을 강제하지만,
// 단위 테스트는 node에서 직접 import하므로 빈 모듈로 대체한다. (server-only 모듈은 export 없음.)
export {};
