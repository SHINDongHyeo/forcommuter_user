import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import DeletedUser from './deleted_user.entity';
import DeleteReason from './delete_reason.entity';

@Entity()
class DeletedReasonLog {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => DeletedUser, (deletedUser) => deletedUser.id, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'deleted_user_id' })
	deletedUser: DeletedUser;

	@ManyToOne(() => DeleteReason, (deleteReason) => deleteReason.id, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'delete_reason_id' })
	deleteReason: DeleteReason;
}
export default DeletedReasonLog;
