{% include 'partials/java-package' -%}
import com.fasterxml.jackson.databind.ObjectMapper;

public class JacksonSerializer<T> implements Serializer<T> {
	
	Class<T> objectClass;
	private ObjectMapper mapper;
	
	public JacksonSerializer(Class<T> objectClass, ObjectMapper mapper) {
		this.objectClass = objectClass;
		this.mapper = mapper;
	}

	@Override
	public String serialize(T object) throws Exception {
		return mapper.writeValueAsString(object);
	}

	@Override
	public T deserialize(String string) throws Exception {
		return mapper.readValue(string, objectClass);
	}

}
