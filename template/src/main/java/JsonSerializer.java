{% include 'partials/java-package' -%}
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonSerializer<T> extends JacksonSerializer<T> {

	public JsonSerializer(Class<T> objectClass) {
		super(objectClass, new ObjectMapper());
	}

}
