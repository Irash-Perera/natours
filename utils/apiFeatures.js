class APIFeatures{
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        let queryObj = { ...this.queryString };
        const excludeFields = ['sort', 'fields', 'limit', 'page'];
        excludeFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
        } else {
            this.query = this.query.sort('_id');
        }

        return this;
    }

    selectFields() {
        if (this.queryString.fields) {
            this.query = this.query.select(this.queryString.fields.split(',').join(' '));
        } else {
            this.query = this.query.select('-__v ');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 20;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIFeatures;