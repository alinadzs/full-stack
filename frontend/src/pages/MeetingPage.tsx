import { useParams } from "react-router-dom";

const MeetingPage = () => {
  const { id } = useParams();

  return (
    <div className="container">
      <h2>Meeting #{id}</h2>
      <textarea placeholder="Заметки обсуждения" />
      <button>Сохранить заметки</button>

      <h3>Задачи</h3>
      <div className="card">Подготовить ТЗ</div>
      <div className="card">Согласовать бюджет</div>

      <h3>Итоги встречи</h3>
      <textarea placeholder="Краткое резюме обсуждения" />
      <button>Сохранить итоги</button>
    </div>
  );
};

export default MeetingPage;