{% include 'partials/java-package' -%}
public class SerializerFactory {

	private static String JSON = "application/json";
	private static String XML = "application/xml";
	private static String defaultContentType = "{{ asyncapi.defaultContentType() if asyncapi.defaultContentType() else "application/json" }}";
	
	public static <T> Serializer<T> getSerializer(String contentType, Class<T> objectClass) throws Exception {
		Serializer<T> ret = null;
		
		if (contentType == null || contentType.length() == 0) {
			contentType = defaultContentType;
		}
		
		if (contentType.equals(XML)) {
			ret = new XmlSerializer<T>(objectClass);
		} else if (contentType.equals(JSON)) {
			ret = new JsonSerializer<T>(objectClass);
		} else {
			throw new Exception("Unknown content type: " + contentType);
		}
		
		return ret;
	}
}

