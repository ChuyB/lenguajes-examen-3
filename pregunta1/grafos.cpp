#include <queue>
#include <stack>
#include <unordered_map>
#include <unordered_set>
#include <vector>

class Grafo {
public:
  std::unordered_map<int, std::vector<int>> adyacencias;
  void agregarArista(int nodo1, int nodo2) {
    adyacencias[nodo1].push_back(nodo2);
  }
};

class Busqueda {
protected:
  Grafo grafo;

public:
  Busqueda(const Grafo &g) : grafo(g) {}

  virtual ~Busqueda() {}

  virtual int buscar(int D, int H) = 0;
};

class DFS : public Busqueda {
public:
  DFS(const Grafo &g) : Busqueda(g) {}

  int buscar(int D, int H) override {
    std::unordered_set<int> visitados;
    std::stack<int> pila;
    pila.push(D);
    int nodosExplorados = 0;

    while (!pila.empty()) {
      int nodo = pila.top();
      pila.pop();

      if (visitados.count(nodo) == 0) {
        visitados.insert(nodo);
        nodosExplorados++;

        if (nodo == H) {
          return nodosExplorados;
        }

        for (int vecino : grafo.adyacencias[nodo]) {
          if (visitados.count(vecino) == 0) {
            pila.push(vecino);
          }
        }
      }
    }

    return -1; // H no es alcanzable desde D
  }
};

class BFS : public Busqueda {
public:
  BFS(const Grafo &g) : Busqueda(g) {}

  int buscar(int D, int H) override {
    std::unordered_set<int> visitados;
    std::queue<int> cola;
    cola.push(D);
    int nodosExplorados = 0;

    while (!cola.empty()) {
      int nodo = cola.front();
      cola.pop();

      if (visitados.count(nodo) == 0) {
        visitados.insert(nodo);
        nodosExplorados++;

        if (nodo == H) {
          return nodosExplorados;
        }

        for (int vecino : grafo.adyacencias[nodo]) {
          if (visitados.count(vecino) == 0) {
            cola.push(vecino);
          }
        }
      }
    }

    return -1; // H no es alcanzable desde D
  }
};
