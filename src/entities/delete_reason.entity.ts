import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import DeletedReasonLog from './deleted_reason_log.entity';

@Entity()
class DeleteReason {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'text' })
	detail: string;

	@OneToMany(
		() => DeletedReasonLog,
		(deletedReasonLog) => deletedReasonLog.id,
	)
	deletedReasonLogs: DeletedReasonLog[];
}
export default DeleteReason;
