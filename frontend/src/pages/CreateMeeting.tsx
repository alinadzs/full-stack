const CreateMeeting = () => {
  return (
    <div className="container">
      <h2>CreateMeeting</h2>
      <input placeholder="Название собрания" />
      <input type="date" />
      <textarea placeholder="Повестка встречи" />
      <button>Сохранить</button>
      <button className="secondary">Отмена</button>
    </div>
  );
};

export default CreateMeeting;