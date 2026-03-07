import { Link } from "react-router-dom";

const MeetingsList = () => {
  const meetings = [
    { id: 1, title: "Планирование проекта", status: "planned" },
    { id: 2, title: "Отчет по кварталу", status: "done" },
  ];

  return (
    <div className="container">
      <h2>MeetingsList</h2>
      <Link to="/create">
        <button>+ Создать собрание</button>
      </Link>

      {meetings.map((m) => (
        <div key={m.id} className="card">
          <Link to={`/meetings/${m.id}`}>
            <h4>{m.title}</h4>
          </Link>
          <p className={m.status === "planned" ? "status-planned" : "status-done"}>
            {m.status === "planned" ? "Запланировано" : "Завершено"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MeetingsList;