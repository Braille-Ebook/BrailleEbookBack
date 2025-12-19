import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';
import Book from './book';

class BookEmbedding extends Model {}

BookEmbedding.init(
    {
        book_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: Book,
                key: 'book_id',
            },
        },
        embedding: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'BookEmbedding',
        tableName: 'BookEmbedding',
        timestamps: false,
    }
);

export default BookEmbedding;
