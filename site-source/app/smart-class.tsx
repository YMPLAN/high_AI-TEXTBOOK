"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, Eye,
  EyeOff, Film, Grid2X2, Lightbulb, ListChecks, Menu, Play, RotateCcw,
  Sparkles, Target, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { sectionGroups, sectionMeta, slides, type Slide, type Visual } from "./slides";

const kindLabel: Record<Slide["kind"], string> = {
  cover: "단원 도입", hook: "생각 열기", explain: "개념 설명", motion: "개념 애니메이션",
  compare: "비교·분석", activity: "교과서 활동", solution: "풀이 화면", quiz: "정답 확인", summary: "내용 정리",
};

const kindIcon: Record<Slide["kind"], string> = {
  cover: "Ⅰ", hook: "?", explain: "개", motion: "▶", compare: "↔", activity: "활", solution: "답", quiz: "Q", summary: "✓",
};

function VisualBoard({ type, bullets, step }: { type?: Visual; bullets: string[]; step: number }) {
  const labels: Record<Visual, string[]> = {
    "ai-cycle": ["입력", "인식", "학습·추론", "판단"], layers: ["인공지능", "기계학습", "딥러닝"],
    traits: ["빅데이터", "인식", "학습", "추론", "예측", "문제 해결"], turing: ["평가자", "대화", "인간?", "기계?"],
    "before-after": ["도입 전", "데이터", "AI 판단", "도입 후"], history: ["1950s", "1980s", "2010s", "현재"],
    "search-space": ["초기 상태", "가능한 상태", "연산자", "목표 상태"], dfs: ["A", "B", "D", "E", "C", "F", "G"],
    bfs: ["A", "B", "C", "D", "E", "F", "G"], heuristic: ["상태 A · 4", "상태 B · 2", "상태 C · 5", "B 선택"],
    hill: ["현재 · 6", "이웃 · 4", "이웃 · 3", "지역 최적"], astar: ["g(n)", "+", "h(n)", "= f(n)"],
    code: ["State", "operator", "h()+g()", "open / closed"], expert: ["사용자", "추론 엔진", "지식 베이스", "결론"],
    semantic: ["나비", "곤충", "날개", "관계"], rules: ["사실", "IF 조건", "THEN 결과", "새 사실"],
    inference: ["사실", "규칙 1", "중간 결론", "규칙 2", "최종 결론"], diagnosis: ["심한 기침", "감염 의심", "발열", "폐렴 후보"],
  };
  const items = type ? labels[type] : bullets;
  return (
    <div className={`visual-board visual-${type ?? "default"}`}>
      <div className="visual-track" aria-label="개념 시각화">
        {items.map((item, i) => (
          <div key={`${item}-${i}`} className={`visual-node ${i <= step ? "on" : ""}`}>
            <span>{String(i + 1).padStart(2, "0")}</span><strong>{item}</strong>
            {i < items.length - 1 && <ChevronRight className="node-arrow" size={18} />}
          </div>
        ))}
      </div>
      {bullets.length > 0 && (
        <div className="visual-notes">
          {bullets.map((item, i) => <p key={item} className={i <= step ? "on" : ""}><Check size={15} />{item}</p>)}
        </div>
      )}
    </div>
  );
}

function SmartClass() {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [response, setResponse] = useState("");
  const slide = slides[index];
  const section = sectionMeta.find((item) => item.id === slide.section) ?? sectionMeta[0];
  const progress = ((index + 1) / slides.length) * 100;

  const lessonLinks = useMemo(() => {
    const seen = new Set<string>();
    return slides.map((item, i) => ({ item, i })).filter(({ item }) => {
      const key = `${item.section}-${item.lesson}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }, []);

  const move = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(slides.length - 1, next)));
    setStage(0); setSelected(null); setChecked(false); setAnswerOpen(false); setResponse(""); setListOpen(false);
  }, []);

  const maxStage = Math.max((slide.bullets?.length ?? 1) - 1, 0);
  const advance = useCallback(() => setStage((value) => value >= maxStage ? 0 : value + 1), [maxStage]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") move(index + 1);
      if (event.key === "ArrowLeft") move(index - 1);
      if (event.key === " " && slide.kind === "motion") { event.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [advance, index, move, slide.kind]);

  return (
    <SidebarProvider defaultOpen={false} style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <Sidebar className="border-r border-[#dce9e3] bg-[#f8fbf9] text-[#17352d]" collapsible="offcanvas">
        <SidebarHeader className="border-b border-[#dce9e3] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-[#36c98f] text-white shadow-[0_8px_20px_rgba(54,201,143,.24)]"><Sparkles size={20} /></div>
            <div><p className="text-[10px] font-black tracking-[.2em] text-[#36a97d]">UNIT 1 SAMPLE</p><h1 className="text-sm font-bold">인공지능 기초 스마트 수업</h1></div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-3">
          {sectionGroups.map((group) => (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel className="h-auto px-2 py-2 text-[#365b50]">
                <span className="mr-2 size-2 rounded-full" style={{ background: group.color }} />
                <span className="truncate">{group.title}</span><span className="ml-auto rounded-full bg-[#e7f4ee] px-2 py-0.5 text-[10px] text-[#43806d]">{group.slides.length}</span>
              </SidebarGroupLabel>
              <SidebarGroupContent><SidebarMenu>
                {lessonLinks.filter(({ item }) => item.section === group.id).map(({ item, i }) => (
                  <SidebarMenuItem key={`${item.section}-${item.lesson}`}>
                    <SidebarMenuButton isActive={slide.lesson === item.lesson && slide.section === item.section} onClick={() => move(i)} className="h-auto min-h-9 rounded-xl px-3 py-2 text-[#668078] hover:bg-[#eaf6f0] hover:text-[#17352d] data-[active=true]:bg-[#dff5ea] data-[active=true]:font-bold data-[active=true]:text-[#176f53]" tooltip={item.lesson}>
                      <span className="truncate text-xs">{item.lesson}</span><span className="ml-auto text-[10px] text-[#94aaa3]">p.{item.page}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu></SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t border-[#dce9e3] bg-white p-4 text-[11px] leading-5 text-[#779189]">
          <div className="flex items-center gap-2"><BookOpen size={14} /> 길벗 교과서 1단원 p.8–53</div>
          <div>교과서 46쪽 → 수업 화면 {slides.length}개</div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f1f7f4]">
        <header className="flex h-16 items-center justify-between border-b border-[#dce9e3] bg-white/95 px-4 shadow-[0_4px_18px_rgba(31,88,69,.04)] backdrop-blur-xl md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="rounded-xl border border-[#cfe5db] bg-[#f6fbf8] text-[#236b55]"><Menu /></SidebarTrigger>
            <span className="hidden rounded-full px-3 py-1 text-xs font-black shadow-sm sm:inline-flex" style={{ background: section.color, color: "#17352d" }}>UNIT Ⅰ</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold text-[#111827]">{slide.lesson}</p><p className="truncate text-xs text-[#697386]">{kindLabel[slide.kind]} · 교과서 {slide.page}쪽</p></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="rounded-xl border-[#cfe5db] bg-[#f6fbf8] text-[#236b55] hover:bg-[#e7f6ef]" onClick={() => setListOpen(true)}><Grid2X2 /><span className="hidden sm:inline">전체 목록</span></Button>
            <span className="font-mono text-xs font-bold text-[#697386]">{String(index + 1).padStart(3, "0")} / {slides.length}</span>
            <div className="hidden w-28 sm:block"><Progress value={progress} className="h-1.5 bg-black/8 [&_[data-slot=progress-indicator]]:bg-[#111827]" /></div>
          </div>
        </header>

        <main className="flex min-h-[calc(100svh-4rem)] flex-col p-3 md:p-5 lg:p-6">
          <section className={`slide-frame kind-${slide.kind}`} style={{ "--unit": section.color } as React.CSSProperties}>
            <div className="slide-grid" aria-hidden="true" />
            <div className="slide-doodles" aria-hidden="true"><i /><i /><i /><span>✦</span><span>+</span></div>
            <div className="slide-topline">
              <div className="flex items-center gap-2"><span className="kind-dot" /><span>{kindLabel[slide.kind]}</span><ChevronRight size={14} /><span>{slide.eyebrow}</span></div>
              <span className="page-chip">교과서 p.{slide.page}</span>
            </div>

            <div className="slide-content">
              <div className="slide-copy">
                <p className="slide-kicker"><Sparkles size={14} />{slide.eyebrow}</p><h2>{slide.title}</h2><div className="title-swoosh" aria-hidden="true" /><p className="slide-lead">{slide.lead}</p>
                {slide.summary && <div className="lesson-summary"><div className="summary-label"><BookOpen size={18} /><span>학습 내용 요약</span></div><p>{slide.summary}</p></div>}
                {slide.prompt && <div className="prompt-card"><CircleHelp size={20} /><p>{slide.prompt}</p></div>}
              </div>

              <div className="slide-workspace">
                {slide.quiz ? (
                  <div className="quiz-card">
                    <div className="quiz-question"><Target size={20} /><span>{slide.quiz.question}</span></div>
                    <div className="quiz-options">{slide.quiz.options.map((option, optionIndex) => {
                      const correct = optionIndex === slide.quiz!.answer;
                      const state = checked ? (correct ? "correct" : selected === optionIndex ? "wrong" : "") : selected === optionIndex ? "selected" : "";
                      return <button key={option} className={`quiz-option ${state}`} onClick={() => !checked && setSelected(optionIndex)}><span>{optionIndex + 1}</span>{option}{checked && correct && <Check size={18} />}{checked && selected === optionIndex && !correct && <X size={18} />}</button>;
                    })}</div>
                    {checked && <div className="answer-panel is-open"><Lightbulb size={19} /><p>{slide.quiz.explanation}</p></div>}
                  </div>
                ) : slide.kind === "activity" ? (
                  <div className="activity-board">
                    <label htmlFor="student-answer"><span>나의 생각</span><small>수업 중 입력해 보세요</small></label>
                    <textarea id="student-answer" value={response} onChange={(e) => setResponse(e.target.value)} placeholder="근거와 함께 작성하세요." />
                    {slide.answer && answerOpen && <div className="answer-panel is-open"><Lightbulb size={19} /><p>{slide.answer}</p></div>}
                  </div>
                ) : slide.kind === "solution" ? (
                  <div className="solution-board">
                    <div className="solution-cover"><ListChecks size={34} /><strong>풀이·예시 답안</strong><p>먼저 스스로 해결한 뒤 아래 단추로 확인하세요.</p></div>
                    <div className={`answer-panel ${answerOpen ? "is-open" : ""}`}><Lightbulb size={19} /><p>{answerOpen ? slide.answer : "정답과 해설이 가려져 있습니다."}</p></div>
                  </div>
                ) : (
                  <VisualBoard type={slide.visual} bullets={slide.bullets ?? []} step={slide.kind === "motion" ? stage : 99} />
                )}
              </div>

              {slide.note && <div className="callout"><Lightbulb size={19} /><p>{slide.note}</p></div>}
            </div>

            <div className="class-mascot" aria-hidden="true">
              <span className="mascot-antenna">✦</span><div className="mascot-face"><i /><i /><b>⌣</b></div><div className="mascot-body">AI</div><span className="mascot-wave">⌁</span>
            </div>

            <div className="slide-footer">
              <div className="unit-mark"><span style={{ color: section.color }}>Ⅰ</span><span>{section.title}</span></div>
              <div className="slide-actions">
                {slide.kind === "motion" && <Button className="check-button" onClick={advance}>{stage >= maxStage ? <RotateCcw /> : <Play />}{stage >= maxStage ? "처음부터" : "다음 장면"}</Button>}
                {slide.kind === "activity" && slide.answer && <Button className="check-button" onClick={() => setAnswerOpen(!answerOpen)}>{answerOpen ? <EyeOff /> : <Eye />}{answerOpen ? "예시 숨기기" : "예시 답안"}</Button>}
                {slide.kind === "solution" && <Button className="check-button" onClick={() => setAnswerOpen(!answerOpen)}>{answerOpen ? <EyeOff /> : <Eye />}{answerOpen ? "풀이 숨기기" : "풀이 확인"}</Button>}
                {slide.quiz && <Button className="check-button" disabled={selected === null} onClick={() => checked ? (setSelected(null), setChecked(false)) : setChecked(true)}>{checked ? <RotateCcw /> : <Check />}{checked ? "다시 풀기" : "정답 확인"}</Button>}
              </div>
            </div>
          </section>

          <nav className="deck-controls" aria-label="슬라이드 이동">
            <Button variant="outline" size="lg" disabled={index === 0} onClick={() => move(index - 1)}><ArrowLeft /> 이전</Button>
            <div className="hidden items-center gap-2 text-xs font-semibold text-[#697386] sm:flex"><Film size={15} />{slide.lesson}</div>
            <Button size="lg" className="bg-[#22a875] text-white shadow-[0_8px_20px_rgba(34,168,117,.2)] hover:bg-[#188a60]" disabled={index === slides.length - 1} onClick={() => move(index + 1)}>다음<ArrowRight /></Button>
          </nav>
        </main>

        <Dialog open={listOpen} onOpenChange={setListOpen}>
          <DialogContent className="max-h-[88svh] max-w-[min(92vw,76rem)] overflow-hidden rounded-3xl border-0 p-0">
            <DialogHeader className="border-b p-6 pr-14"><DialogTitle>1단원 전체 수업 화면</DialogTitle><DialogDescription>교과서 쪽수와 변환된 화면 유형을 확인하고 바로 이동할 수 있습니다.</DialogDescription></DialogHeader>
            <div className="list-scroll">
              {sectionGroups.map((group) => <section key={group.id} className="list-section">
                <div className="list-heading"><span style={{ background: group.color }} /><strong>{group.title}</strong><small>{group.range} · {group.slides.length}화면</small></div>
                <div className="thumb-grid">{group.slides.map(({ slide: item, index: itemIndex }) => (
                  <button key={item.id} className={`slide-thumb ${itemIndex === index ? "active" : ""}`} onClick={() => move(itemIndex)}>
                    <div className="thumb-preview" style={{ "--thumb": group.color } as React.CSSProperties}><span>{kindIcon[item.kind]}</span><em>{String(itemIndex + 1).padStart(3, "0")}</em></div>
                    <strong>{item.title}</strong><small>{kindLabel[item.kind]} · p.{item.page}</small>
                  </button>
                ))}</div>
              </section>)}
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SmartClass;
