import { Header } from "./components/Header";
import { PlanContainer } from "./pages/plan/PlanContainer";
import { ErrorBoundary } from "react-error-boundary";
import { Bomb, ErrorPage } from "./ErrorPage";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div
      className="d-flex flex-column justify-content-start"
      style={{ height: "100vh", width: "100vw" }}
    >
      <Header />
      <ErrorBoundary fallback={<ErrorPage />}>
        <Bomb />
        <PlanContainer />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;
