import './Message.scss';

const Message = ({ role, text, loading }) => (
  <div className={`message ${role}`}>
    <div className={`bubble ${loading ? "loading" : ""}`}>
      {loading ? (
        <span className="dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      ) : (
        text
      )}
    </div>
  </div>
);

export default Message;
