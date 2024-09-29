import { Entity, Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Provider } from '../user.interface';
import DeletedReasonLog from './deleted_reason_log.entity';

@Entity()
class DeletedUser {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 100 })
	socialId: string;

	@Column({ type: 'varchar', length: 100 })
	name: string;

	@Column({ type: 'varchar', length: 100 })
	email: string;

	@Column({ type: 'varchar', length: 100 })
	nick: string;

	@Column({ type: 'enum', enum: Provider })
	provider: Provider;

	@Column({ type: 'timestamp' })
	createdAt: Date;

	@CreateDateColumn({ type: 'timestamp' })
	deletedAt: Date;

	@Column({ type: 'text', nullable: true })
	detail: string;

	@OneToMany(() => DeletedReasonLog, (deletedReasonLog) => deletedReasonLog.id)
	deletedReasonLogs: DeletedReasonLog[];
}
export default DeletedUser;
