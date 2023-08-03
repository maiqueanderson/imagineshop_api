import { ObjectId } from "mongodb";
import ProductModel from "../schema/product.schema.js";

export class ProductService {
  constructor() {}

  async add(product) {
    
    await ProductModel.create(product);
  }

  async findAll() {
    return await ProductModel.find({});
  }
  
  async find(id) {
    return await ProductModel.findById(new ObjectId(id));
  }

  
  };
