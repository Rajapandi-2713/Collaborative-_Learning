class APIFeatures {
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
       let keyword =  this.queryStr.title ? {
            title: {
                $regex: this.queryStr.title,
                $options: 'i'
            }
       }: {};

       keyword =  this.queryStr.collegeName ? {
        collegeName: {
            $regex: new RegExp(this.queryStr.collegeName, 'i'),
          }          
        }: {};

       this.query.find({...keyword})
       return this;
    }


    filter(){
        const queryStrCopy = { ...this.queryStr };
  
        //removing fields from query
        const removeFields = ['title', 'page','collegeName'];
        removeFields.forEach( field => delete queryStrCopy[field]);
        this.query.find(queryStrCopy);

        return this;
    }

    paginate(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1)
        this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;