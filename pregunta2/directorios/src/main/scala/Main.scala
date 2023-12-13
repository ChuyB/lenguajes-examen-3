import java.io.File
import scala.concurrent.{Future, ExecutionContext}
import ExecutionContext.Implicits.global

def contarSubdirectorios(directorio: File): Future[Int] = {
  val archivosYSubdirectorios = directorio.listFiles()
  if (archivosYSubdirectorios == null) Future.successful(0)
  else {
    val directorios = archivosYSubdirectorios.filter(_.isDirectory)
    val conteos: Seq[Future[Int]] = directorios.map(contarSubdirectorios)
    Future.sequence(conteos).map(_.sum + directorios.length)
  }
}
