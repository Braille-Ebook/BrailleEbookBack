import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';

export interface UserBookBookmarkAttributes {
    user_id: number;
    book_id: number;
    created_at?: Date;
}

class UserBookBookmark
    extends Model<UserBookBookmarkAttributes>
    implements UserBookBookmarkAttributes
{
    public user_id!: number;
    public book_id!: number;
    public created_at!: Date;
}

UserBookBookmark.init(
    {
        user_id: { type: DataTypes.INTEGER, primaryKey: true },
        book_id: { type: DataTypes.INTEGER, primaryKey: true },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: 'UserBookBookmark', // Sequelize 내부에서 사용할 이름
        tableName: 'UserBookBookmark', // 실제 DB 테이블명
        timestamps: false,
    }
);

export default UserBookBookmark;
