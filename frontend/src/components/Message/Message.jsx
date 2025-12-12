import './Message.scss';

const Message = ({ role, text, loading, dots }) => (
  <div className={`message ${role}`}>
  <div className="bubble">
  {dots && (
    <span className="dots">
      <span></span><span></span><span></span>
    </span>
  )}
  {text}
</div>

  </div>
);

export default Message;
