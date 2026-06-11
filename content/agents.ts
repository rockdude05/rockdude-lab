// 학습 포인트: 타입드 레지스트리 패턴
// 새 에이전트 추가 = 항목 1개 + 스크린샷, 코드 수정 0
// 모든 페이지는 AGENTS 배열을 직접 소비 — 중앙 수정만으로 사이트 전체 반영

export type AgentCategory = "공부"; // 확장 시 union에 추가 — 카테고리 2개 이상이면 그리드 필터 탭 자동 등장
export type DemoStep = { label: string; delayMs: number };
export type AgentDemo = {
  command: string;
  steps: DemoStep[];
  resultImage: string;
  resultCaption: string;
};
export type Agent = {
  id: string;
  name: string;
  category: AgentCategory;
  tagline: string;
  description: string;
  accent: "blue" | "green" | "orange" | "purple";
  image: string;
  status: "live" | "beta";
  demo?: AgentDemo;
};

export const AGENTS: Agent[] = [
  {
    id: "homework",
    name: "과제풀이",
    category: "공부",
    tagline: "기말 풀이 PDF가 텔레그램으로 도착",
    description:
      "수업자료를 대조하고, 계산을 두 번 확인하고, 그림까지 스스로 검증한 풀이를 PDF로 보내줍니다.",
    accent: "blue",
    image: "/agents/homework/card.png",
    status: "live",
    demo: {
      command: "/과제풀이 유기화학1 2024 기말고사",
      steps: [
        { label: "수업자료 대조", delayMs: 900 },
        { label: "그림 8개 생성 — 스스로 검증 통과", delayMs: 1700 },
        { label: "계산 23개 재확인", delayMs: 2500 },
      ],
      resultImage: "/agents/homework/result.png",
      resultCaption: "풀이 PDF 19쪽 — Telegram 도착",
    },
  },
  {
    id: "figures",
    name: "그림 생성",
    category: "공부",
    tagline: "스스로 검증을 통과해야 나오는 그림",
    description:
      "Newman 투영도부터 Mohr 원까지 — 라벨과 배치를 스스로 검사해서, 통과한 그림만 PDF로 내보냅니다.",
    accent: "orange",
    image: "/agents/figures/card.png",
    status: "live",
    demo: {
      command: "/그림작성 Mohr 원 — 삼축압축 3세트",
      steps: [
        { label: "도면 구성", delayMs: 900 },
        { label: "라벨·배치 자동 검사 — 통과", delayMs: 1900 },
      ],
      resultImage: "/agents/figures/result.png",
      resultCaption: "검증 통과 그림 PDF — Telegram 도착",
    },
  },
  {
    id: "paper",
    name: "논문 분석",
    category: "공부",
    tagline: "논문 한 편이 분석 보고서로",
    description:
      "본문은 물론 그림과 표까지 함께 읽고, 핵심 기여와 한계를 정리한 분석 PDF를 보내줍니다.",
    accent: "blue",
    image: "/agents/paper/card.png",
    status: "live",
    demo: {
      command: "/논문 deep — arXiv 논문 1편",
      steps: [
        { label: "본문 9개 섹션 분석", delayMs: 900 },
        { label: "그림·표 판독", delayMs: 1800 },
        { label: "분석 PDF 생성", delayMs: 2600 },
      ],
      resultImage: "/agents/paper/result.png",
      resultCaption: "논문 분석 PDF — Telegram 도착",
    },
  },
  {
    id: "analysis",
    name: "강의분석",
    category: "공부",
    tagline: "막히는 개념을 수업자료 기준으로 다시 설명",
    description:
      "수업에서 다룬 범위 안에서 개념을 다시 설명하고, 어느 자료 어느 페이지에서 나온 내용인지 출처를 함께 보여줍니다.",
    accent: "purple",
    image: "/agents/analysis/card.png",
    status: "live",
  },
  {
    id: "notes",
    name: "공부노트",
    category: "공부",
    tagline: "기출이 알려주는 범위로 만든 시험 대비 노트",
    description:
      "기출에 한 번이라도 나온 개념은 빠짐없이 담아, 이해 중심의 공부노트 PDF를 만들어줍니다.",
    accent: "green",
    image: "/agents/notes/card.png",
    status: "live",
  },
  {
    id: "lecture",
    name: "강의정리",
    category: "공부",
    tagline: "강의 영상이 정리 노트로",
    description:
      "강의 영상에서 음성을 받아 적고, 수업 흐름을 따라 정리한 노트로 만들어줍니다.",
    accent: "purple",
    image: "/agents/lecture/card.png",
    status: "live",
  },
  {
    id: "lab",
    name: "실험보고서",
    category: "공부",
    tagline: "결과보고서 Discussion 초안을 문헌과 함께",
    description:
      "표준시험법과 문헌값을 찾아 내 실험값과 비교한 Discussion 초안을 써줍니다 — 인용은 전부 검증 가능한 것만.",
    accent: "green",
    image: "/agents/lab/card.png",
    status: "live",
  },
  {
    id: "cogva",
    name: "학습 뷰어 Cogva",
    category: "공부",
    tagline: "과목 자료와 풀이를 한 화면에서",
    description:
      "과목별 수업자료·기출·풀이를 자동으로 모아 보여주는 데스크톱 뷰어 — 시험지와 풀이를 나란히 띄워 공부합니다.",
    accent: "orange",
    image: "/agents/cogva/card.png",
    status: "live",
  },
];

// 학습 포인트: 타입 술어(type predicate) 내로잉
// (a): a is Agent & { demo: AgentDemo } — 반환 타입을 좁혀서
// DEMO_AGENTS 배열에서 demo 필드를 undefined 없이 안전하게 사용 가능
export const DEMO_AGENTS = AGENTS.filter(
  (a): a is Agent & { demo: AgentDemo } => a.demo !== undefined,
);
