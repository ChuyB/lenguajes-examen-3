#include <vector>
#include <deque>
#include <stdexcept>

template <typename T> class Secuencia {
public:
  virtual void agregar(const T &elemento) = 0;
  virtual T remover() = 0;
  virtual bool vacio() const = 0;
};

// Implementación de la clase Pila
template <typename T>
class Pila : public Secuencia<T> {
private:
    std::vector<T> elementos;

public:
    void agregar(const T& elemento) override {
        elementos.push_back(elemento);
    }

    T remover() override {
        if (vacio()) {
            throw std::runtime_error("La pila está vacía");
        }

        T elemento = elementos.back();
        elementos.pop_back();
        return elemento;
    }

    bool vacio() const override {
        return elementos.empty();
    }
};

// Implementación de la clase Cola
template <typename T>
class Cola : public Secuencia<T> {
private:
    std::deque<T> elementos;

public:
    void agregar(const T& elemento) override {
        elementos.push_back(elemento);
    }

    T remover() override {
        if (vacio()) {
            throw std::runtime_error("La cola está vacía");
        }

        T elemento = elementos.front();
        elementos.pop_front();
        return elemento;
    }

    bool vacio() const override {
        return elementos.empty();
    }
};
