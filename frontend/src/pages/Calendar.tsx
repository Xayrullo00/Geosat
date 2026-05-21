import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";

export default function Calendar() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<{ day: number; task: string }[]>([]);

  useEffect(() => {
    api<{ tasks: { day: number; task: string }[] }>("/calendar?crop=general").then((d) => setTasks(d.tasks));
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-leaf-800">📅 {t("nav.calendar")}</h2>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.day} className="card flex gap-4 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-600 font-bold text-white">{task.day}</span>
            <p className="flex-1 pt-2">{task.task}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
