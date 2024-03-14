import { Provider } from "react-redux";
import Body from "./components/Body";
import appStore from "./utils/appStore";

function App() {
  const error = true; // Replace with your error condition

  return (
    <Provider store={appStore}>
      <Body/>
    </Provider>
    // <div className={error ? 'text-red-600' : 'text-green-600'}>Hello Tailwind!</div>
  );
}

export default App;
