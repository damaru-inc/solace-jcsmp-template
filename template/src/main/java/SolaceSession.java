{% include 'partials/java-package' -%}
import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.solacesystems.jcsmp.JCSMPSession;
import com.solacesystems.jcsmp.SpringJCSMPFactory;

@Component
public class SolaceSession {

	@Autowired
	private SpringJCSMPFactory springJCSMPFactory;
	private JCSMPSession session;

	@PostConstruct
	public void init() throws Exception {
		session = springJCSMPFactory.createSession();
	}

	public JCSMPSession getSession() {
		return session;
	}

	public void close() {
		if (!session.isClosed()) {
			session.closeSession();
		}
	}
}
