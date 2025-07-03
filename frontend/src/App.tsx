import Editor from './components/Editor/Editor';
import StatusBar from './components/StatusBar/StatusBar';

export default function App() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 relative">
        <Editor />
      </div>
      <StatusBar />
    </div>
  );
}
