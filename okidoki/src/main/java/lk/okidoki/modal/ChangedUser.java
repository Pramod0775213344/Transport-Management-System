package lk.okidoki.modal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangedUser {

    private String username;

    private String oldusername;

    private String newpassword;

    private String oldpassword;

    private String email;

    private byte[] user_photo;

    private Integer employee_id;

}
