package tn.esprit.refundservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class RefundServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RefundServiceApplication.class, args);
    }

}
