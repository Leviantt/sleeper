import { BaseSchema } from '@app/common/database/base.schema';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { LoggerService, NotFoundException } from '@nestjs/common';

export abstract class BaseRepository<TDocument extends BaseSchema> {
  protected readonly logger: LoggerService;

  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const newDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    await newDocument.save();
    return newDocument.toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.log('Not found document with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    updateValues: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model.findOneAndUpdate(
      filterQuery,
      updateValues,
      { lean: true, new: true },
    );

    if (!document) {
      this.logger.log('Not found document with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    return this.model.findOneAndDelete(filterQuery, { lean: true });
  }
}
