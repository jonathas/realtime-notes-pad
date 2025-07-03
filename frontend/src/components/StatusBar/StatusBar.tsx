import './StatusBar.css';

export default function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-item">Connected</span>
      <span className="status-item">Editing: Note Title</span>
      <span className="status-item">Last saved: Just now</span>
    </div>
  );
}