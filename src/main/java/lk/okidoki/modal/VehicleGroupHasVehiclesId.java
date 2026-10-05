package lk.okidoki.modal;
import java.io.Serializable;
import java.util.Objects;

public class VehicleGroupHasVehiclesId implements Serializable {
    private Integer vehicle_group_id;
    private Integer vehicle_id;

    public VehicleGroupHasVehiclesId() {
    }

    public VehicleGroupHasVehiclesId(Integer vehicle_group_id, Integer vehicle_id) {
        this.vehicle_group_id = vehicle_group_id;
        this.vehicle_id = vehicle_id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof VehicleGroupHasVehiclesId))
            return false;
        VehicleGroupHasVehiclesId that = (VehicleGroupHasVehiclesId) o;
        return Objects.equals(vehicle_group_id, that.vehicle_group_id) &&
                Objects.equals(vehicle_id, that.vehicle_id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(vehicle_group_id, vehicle_id);
    }
}
