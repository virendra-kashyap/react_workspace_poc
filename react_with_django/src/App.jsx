
import "./App.css";
import PresignedUrlGenerator from "./components/PresignedUrlGenerator";
import RabbitMQStompClient from "./components/RabbitMQStompClient";

function App() {

  return (
    <>
      <PresignedUrlGenerator/>
      <RabbitMQStompClient /> 

    </>
  );
}

export default App;
