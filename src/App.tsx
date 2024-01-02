import { Header } from "./components/Header";
import { PlanContainer } from "./pages/plan/PlanContainer";
import { Footer } from "./components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={true} />
      <Header />
      <div style={{ minHeight: "85vh" }}>
        <PlanContainer />
      </div>
      <Footer />
    </QueryClientProvider>
  );
}

export default App;
