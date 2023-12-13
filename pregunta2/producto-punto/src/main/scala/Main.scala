import scala.concurrent.{Future, ExecutionContext}
import scala.util.{Failure, Success}

implicit val ec: ExecutionContext = ExecutionContext.global

def dotProduct(vec1: Array[Int], vec2: Array[Int]): Future[Int] = {
  // Verifica que los vectores tienen el mismo tamaño
  if (vec1.length != vec2.length) {
    Future.failed(new IllegalArgumentException("Los vectores deben tener el mismo tamaño"))
  } else {
    // Calcula el producto punto en paralelo
    Future.sequence(
      vec1.zip(vec2).map { case (num1, num2) => Future(num1 * num2) }
    ).map(_.sum)
  }
}
