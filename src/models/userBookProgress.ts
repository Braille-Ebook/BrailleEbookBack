import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

export interface UserBookProgressAttributes {
    user_id: number;
    book_id: number;
    updated_at?: Date;
    last_page?: number;
    last_char?: number;
}

interface UserBookProgressCreationAttributes
    extends Optional<
        UserBookProgressAttributes,
        'updated_at' | 'last_page' | 'last_char'
    > {}

class UserBookProgress
    extends Model<
        UserBookProgressAttributes,
        UserBookProgressCreationAttributes
    >
    implements UserBookProgressAttributes
{
    public user_id!: number;
    public book_id!: number;
    public updated_at!: Date;
    public last_page!: number;
    public last_char!: number;
}

UserBookProgress.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        book_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        last_page: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        last_char: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: 'UserBookProgress',
        tableName: 'UserBookProgress',
        timestamps: false,
    }
);

export default UserBookProgress;
