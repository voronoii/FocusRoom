# Design System — FocusRoom

## Product Context
- **What this is:** 대화 없는 가상 코워킹 스페이스. 익명 아바타로 입장해서 함께 타이머를 돌리는 body doubling 앱.
- **Who it's for:** 원격근무 직장인 + 수험생 (한국 시장 우선)
- **Space/industry:** Virtual coworking / productivity. 경쟁: Focusmate, Flow Club, Flown, Caveday
- **Project type:** Web app (Next.js PWA)

## Aesthetic Direction
- **Direction:** Organic/Natural — 카페 공간의 따뜻함
- **Decoration level:** Intentional — 시간대별 배경색 전환 + 미세한 grain 텍스처
- **Mood:** "혼자인데 외롭지 않다." 디지털 대시보드가 아닌 물리적 공간에 들어와 있는 느낌. 원목, 리넨, 커피의 소재감.
- **Reference sites:** Focusmate (보라+크림, 전문적), Flown (흑백 미니멀), Flow Club (파랑, 커뮤니티), Caveday (앰버+블랙, 대담)
- **Differentiation:** 경쟁사 전원이 "서비스를 파는" SaaS 디자인. FocusRoom은 "장소에 들어가는" 환경적 디자인으로 차별화.

## Typography
- **Display/Hero:** Fraunces (variable, optical axis) — 카페 간판/메뉴판의 따뜻한 serif. 경쟁사 전원 sans-serif에서 유일한 차별점.
  - Loading: Google Fonts `Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900`
- **Body:** Plus Jakarta Sans — 매끄러운 geometric sans, 뛰어난 가독성
  - Loading: Google Fonts `Plus+Jakarta+Sans:wght@400;500;600;700`
- **Korean:** Pretendard (variable) — Plus Jakarta Sans와 자연스럽게 보완
  - Loading: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`
- **Data/Timer:** Geist Mono — tabular-nums 지원, 타이머에 완벽
  - Loading: `https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-mono/GeistMono-Variable.woff2`
- **Code:** Geist Mono
- **Scale:**
  ```
  --text-xs:   12px / 1.5    (캡션, 레이블)
  --text-sm:   13px / 1.5    (보조 텍스트)
  --text-base: 14px / 1.6    (본문)
  --text-md:   16px / 1.5    (강조 본문, 버튼)
  --text-lg:   20px / 1.4    (섹션 제목)
  --text-xl:   28px / 1.2    (페이지 제목)
  --text-2xl:  36px / 1.1    (히어로, Fraunces)
  --text-3xl:  48px / 1.0    (타이머 디스플레이, Geist Mono)
  ```

## Color
- **Approach:** Restrained — 시간대별 배경색이 주인공, 액센트는 커피 브라운 하나
- **Accent:** `#C8956C` (커피 브라운) — CTA, 선택 상태, 링크. 경쟁사의 보라/파랑과 완전히 다른 어휘.
- **Accent hover:** `#B07D56`

### Light Mode (Morning — default)
```css
--bg:             #FFF8F0;   /* 따뜻한 밀크티 */
--bg-surface:     #FFFFFF;   /* 카드/인풋 배경 */
--bg-afternoon:   #FAF9F6;   /* 오후 아이보리 */
--text-primary:   #2C2C2C;
--text-secondary: #8C8C8C;
--accent:         #C8956C;
--accent-hover:   #B07D56;
--border:         #E8E0D8;   /* 따뜻한 회색 */
--online-dot:     #5A7D5A;
--timer-urgent:   #C75B5B;   /* 5분 미만 */
```

### Dark Mode (Evening)
```css
--bg:             #1C1D2B;   /* 밤 라운지 */
--bg-surface:     #252636;
--text-primary:   #E0E0E0;
--text-secondary: #8C8C8C;
--accent:         #D4A574;   /* 밝아진 브라운 */
--accent-hover:   #C8956C;
--border:         #3A3B4F;
--online-dot:     #6B9E6B;
--timer-urgent:   #E07070;
```

### Time-based Backgrounds
```css
/* 06-12시 */ --bg-morning:   #FFF8F0;  /* 따뜻한 밀크티 */
/* 12-18시 */ --bg-afternoon: #FAF9F6;  /* 밝은 아이보리 */
/* 18-06시 */ --bg-evening:   #1C1D2B;  /* 밤 라운지 네이비 */
```

### Semantic Colors
```css
--success:  #5A7D5A;   /* 완료, 온라인 */
--error:    #C75B5B;   /* 에러, 타이머 긴급 */
--warning:  #C8956C;   /* 경고 (액센트와 동일) */
--info:     #6B8CAE;   /* 정보성 배너 */
```

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable
- **Scale:**
  ```
  --space-2xs:  2px
  --space-xs:   4px
  --space-sm:   8px
  --space-md:   16px
  --space-lg:   24px
  --space-xl:   32px
  --space-2xl:  48px
  --space-3xl:  64px
  ```

## Layout
- **Approach:** Grid-disciplined — Room 아바타 그리드가 핵심
- **Grid:**
  ```
  Mobile  (<480px):   2 columns, 100% width, padding 16px
  Tablet  (480-768px): 3 columns, padding 24px
  Desktop (768px+):    4 columns, max-width 600px, centered
  ```
- **Max content width:** 600px (모바일 우선, 카페 좌석 범위의 친밀감)
- **Border radius:**
  ```
  --radius-sm:   6px    (칩, 작은 요소)
  --radius-md:   10px   (버튼, 인풋, 카드)
  --radius-lg:   14px   (모달, 큰 컨테이너)
  --radius-full: 9999px (아바타, 뱃지)
  ```

## Motion
- **Approach:** Intentional — 입장 시퀀스(1.5초)가 모션의 핵심, 평상시는 미니멀
- **Easing:**
  ```
  --ease-enter: cubic-bezier(0, 0, 0.2, 1)     (ease-out)
  --ease-exit:  cubic-bezier(0.4, 0, 1, 1)      (ease-in)
  --ease-move:  cubic-bezier(0.4, 0, 0.2, 1)    (ease-in-out)
  ```
- **Duration:**
  ```
  --duration-micro:  75ms    (호버, 포커스)
  --duration-short:  150ms   (버튼 press, 토글)
  --duration-medium: 300ms   (모달, 토스트, 페이드)
  --duration-long:   500ms   (페이지 전환)
  ```
- **Room 입장 시퀀스 (1.5초):**
  ```
  0.0s: 배경색 전환 (시간대별)
  0.3s: 아바타 스태거드 페이드인
  0.5s: ambient 카페 소리 페이드인
  0.8s: NPC 👋 말풍선 1
  1.2s: NPC 👋 말풍선 2
  1.5s: 타이머 바 활성화
  ```
- **prefers-reduced-motion:** 모든 애니메이션 스킵, 즉시 전환

## Decoration
- **Grain texture:** 미세한 SVG noise 오버레이로 디지털 평면감 탈피
  ```css
  .grain::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.03;
    background: url("data:image/svg+xml,..."); /* noise pattern */
    pointer-events: none;
  }
  ```
- **시간대별 배경:** CSS custom property 전환, 0.3s duration

## Component Patterns

### Buttons
```
Primary:     bg:#2C2C2C text:#FFF8F0 radius:10px py:14px font:15px/600
             (dark mode: bg:#E0E0E0 text:#1C1D2B)
Secondary:   bg:transparent text:#2C2C2C border:1.5px #2C2C2C radius:10px
Ghost:       bg:transparent text:#8C8C8C no-border underline-on-hover
Accent:      bg:#C8956C text:#FFFFFF radius:10px (선택 상태, 특수 CTA)
```

### Input
```
border:1.5px #E8E0D8 radius:10px py:12px px:14px bg:#FFFFFF
focus: border-color:#C8956C, box-shadow:0 0 0 3px rgba(200,149,108,0.15)
placeholder: #8C8C8C
```

### Time Selector Chips
```
default:  bg:#F5F0EB text:#2C2C2C radius:9999px px:16px py:8px
selected: bg:#C8956C text:#FFFFFF
```

### Toast
```
bg:#2C2C2C text:#FFFFFF radius:10px py:10px px:16px
position: bottom center
animation: slide-up 300ms ease-out
auto-dismiss: 3s
```

### Avatar (Borderless!)
```
NO card border, NO shadow, NO background
avatar: 48px circle (radius:9999px)
name:   text-sm, text-secondary
task:   text-sm, text-primary, max 15chars ellipsis
timer:  Geist Mono, text-sm (urgent: timer-urgent color)
gap:    8px between elements
```

## Anti-Patterns (절대 하지 않는 것)
- 보라/바이올렛 그라데이션
- 3열 아이콘 feature grid
- 모든 것 중앙 정렬
- 균일한 둥근 모서리
- 그라데이션 CTA 버튼
- 제네릭 히어로 카피 ("Welcome to...")
- 아바타에 카드 테두리/그림자

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-25 | Initial design system created | /design-consultation — 경쟁사 리서치 (Focusmate, Flown, Flow Club, Caveday) 기반. "서비스 판매"가 아닌 "장소 진입" 디자인 차별화. |
| 2026-03-25 | Fraunces serif for display | 경쟁사 전원 sans-serif. Serif가 "카페 간판" 느낌으로 즉시 차별화. |
| 2026-03-25 | Coffee brown (#C8956C) accent | 보라/파랑/앰버 대신 브라운으로 "물리적 공간" 어휘 구축. |
| 2026-03-25 | Borderless avatar grid | 카드 테두리 = SaaS 대시보드. 테두리 없는 = 카페 좌석 느낌. |
| 2026-03-25 | Time-based backgrounds | 아침 밀크티 → 오후 아이보리 → 밤 네이비. 공간의 시간 흐름 표현. |
