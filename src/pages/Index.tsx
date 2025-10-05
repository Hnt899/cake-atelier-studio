import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Sweet Line
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Добро пожаловать в мир домашних тортов ручной работы. 
            Каждый торт создан с любовью специально для вас.
          </p>
          <Button 
            onClick={() => navigate('/catalog')} 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Посмотреть каталог
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
