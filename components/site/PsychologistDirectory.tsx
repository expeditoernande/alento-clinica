"use client";

import { useMemo, useState } from "react";
import { PsychologistCard } from "@/components/site/PsychologistCard";
import { approaches, psychologists } from "@/lib/site";

export function PsychologistDirectory() {
  const [approach, setApproach] = useState<string>("todas");
  const [mode, setMode] = useState<"todos" | "online" | "presencial">("todos");

  const list = useMemo(() => {
    return psychologists.filter((person) => {
      const matchesApproach = approach === "todas" || person.approach === approach;
      const matchesMode =
        mode === "todos" ||
        (mode === "online" && person.online) ||
        (mode === "presencial" && person.inPerson);
      return matchesApproach && matchesMode;
    });
  }, [approach, mode]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-line py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setApproach("todas")}
            className={`tag cursor-pointer transition-colors ${
              approach === "todas" ? "border-sage bg-sage-soft text-sage" : ""
            }`}
          >
            Todas as abordagens
          </button>
          {approaches.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setApproach(item.slug)}
              className={`tag cursor-pointer transition-colors ${
                approach === item.slug ? "border-sage bg-sage-soft text-sage" : ""
              }`}
            >
              {item.short}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(["todos", "online", "presencial"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`tag cursor-pointer capitalize transition-colors ${
                mode === option ? "border-sage bg-sage-soft text-sage" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-[13px] text-stone">
        {list.length} {list.length === 1 ? "psicólogo" : "psicólogos"} disponíveis
      </p>

      {list.length === 0 ? (
        <div className="notice mt-6">
          Nenhum psicólogo combina com esse filtro. Tente outra abordagem ou modalidade.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((person) => (
            <PsychologistCard key={person.slug} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
