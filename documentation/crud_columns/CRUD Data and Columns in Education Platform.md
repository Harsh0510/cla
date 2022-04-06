# CRUD Data and Columns in Education Platform

This document describes the state of columns, filters and searches for each object and user type. The description will be conducted per object.
Note that Github incorrectly interprets backticks in markdown, just copy the text file and read in a markdown editor.
***
# Users

Somewhat self explanatory - users are all the people who have access to the education platform functionality (as opposed to those who may "read" the content through a token link).

## School Admin

### Columns

| Email | Title | First Name | Last Name | Role |
| ------ | ------ | ------ | ----- | ------ |


### Fields and Values 

| Field Name | Values | Type | Validation | Error Messages |
| ------ | ------ | ------ | ------ | ------ |
| Role | | Drop Down | Constrained to values of dropdown, Teacher or School Admin | "Please ensure all fields are filled correctly." |
| Title | | Drop Down | Constrained to values of dropdown, Mr, Mrs, Ms, Miss, Dr or Sir | "Please ensure all fields are filled correctly." |
| First Name | | Text Numeric | Max 100 Characters, only prevent `¬|\<>?:@~{}_+!"£$%^&*()/*,./;'#[]|`| "Please ensure all fields are filled correctly." "First name should not contain special characters." "A first name must be 100 characters or less." |
| Last Name | | Text Numeric | Max 100 Characters, only prevent `¬|\<>?:@~{}_+!"£$%^&*()/*,./;'#[]|`| "Please ensure all fields are filled correctly." "Last name should not contain special characters." "A last name must be 100 characters or less." |
| Email | | Text Numeric | Use https://tools.ietf.org/html/rfc6530 , https://tools.ietf.org/html/rfc3696 , https://tools.ietf.org/html/rfc5321 , https://tools.ietf.org/html/rfc5322 |

### Filtering and Searching

#### Filters

| Name | Details |
| ------ | ------ |
| Role | Selector |

#### Searches

| Name | Details |
| ------ | ------ |
| Email | Selector |
| Name | First and Last Name Combined |

## CLA Admin

### Columns

| Email | Title | First Name | Last Name | Role |
| ------ | ------ | ------ | ----- | ------ |


### Fields and Values 

| Field Name | Values | Type | Validation | Error Messages |
| ------ | ------ | ------ | ------ | ------ |
| Role | | Drop Down |  Constrained to values of dropdown, Teacher, CLA Admin or School Admin | "Please ensure all fields are filled correctly." |
| Title | | Drop Down | Constrained to values of dropdown, Mr, Mrs, Ms, Miss, Dr or Sir | "Please ensure all fields are filled correctly." |
| First Name | | Text Numeric | Max 100 Characters, only prevent `¬|\<>?:@~{}_+!"£$%^&*()/*,./;'#[]|`| "Please ensure all fields are filled correctly." "First name should not contain special characters." "A first name must be 100 characters or less." |
| Last Name | | Text Numeric | Max 100 Characters, only prevent `¬|\<>?:@~{}_+!"£$%^&*()/*,./;'#[]|` | "Please ensure all fields are filled correctly." "Last name should not contain special characters." "A last name must be 100 characters or less." |
| Email | | Text Numeric | Max 200 characters, Use https://tools.ietf.org/html/rfc6530 , https://tools.ietf.org/html/rfc3696 , https://tools.ietf.org/html/rfc5321 , https://tools.ietf.org/html/rfc5322 |

### Filtering and Searching

#### Filters

| Name | Details |
| ------ | ------ |
| Role | Selector |
| School | Selector |

#### Searches

| Name | Details |
| ------ | ------ |
| Email | Selector |
| Name | First and Last Name Combined |


#### Drop Down Values

| Field Name | Values |
| ------ | ------ |
| Role  | Teacher |
| Role | School Admin |
| Role | CLA Admin |
| Title | Mr |
| | Mrs |
| | Ms |
| | Dr |
| | Miss |
| | Sir |

***

# Classes

Classes are the holding group for copies - they are "owned" by the creator of the class, but can be used by anyone to place copies. At the moment, classes are open for creation by a variety of roles (all of them, to be precise). 

## School Admin

### Columns

| Date Created | Name | Key Stage | Year Group | Exam Board |
| ------ | ------ | ------ | ----- | ------ |


### Fields and Values 

| Field Name | Values | Type | Validation | Error Messages |
| ------ | ------ | ------ | ------ | ------ |
| Name | | Drop Down | No validation except Max 200 characters | "A class name must be 200 characters or less" |
| Key Stage | | Drop Down | Constrained to drop down values, KS1, KS2, KS3, KS4, KS5, Foundation Stage |
| Year Group | | Text Numeric | No validation except Max 200 characters |"A year group must be 200 characters or less" |
| Number of Students | | Numeric | Max 9999, numbers only |
| Exam Board | | Constrained to Drop Down values |

### Filtering and Searching

#### Filters


| Name | Details |
| ------ | ------ |
| Exam Board | Selector |
| Key Stage | Selector |

#### Searches

| Name | Details |
| ------ | ------ |
| Name | Combined first and last name |
| Year Group |  |

## CLA Admin

### Columns

| Date Created | Name | Key Stage | Year Group | Exam Board |
| ------ | ------ | ------ | ----- | ------ |


### Fields and Values 

| Field Name | Values | Type | Validation | Error Messages |
| ------ | ------ | ------ | ------ | ------ |
| Name | | Drop Down | No validation except Max 200 characters | "A class name must be 200 characters or less" |
| Key Stage | | Drop Down | Constrained to drop down values, KS1, KS2, KS3, KS4, KS5, Foundation Stage |
| Year Group | | Text Numeric | No validation except Max 200 characters |"A year group must be 200 characters or less" |
| Number of Students | | Numeric | Max 9999, numbers only |
| Exam Board | | Constrained to Drop Down values |
| School | | Constrained to Drop Down values |

### Filtering and Searching

#### Filters

| Name | Details |
| ------ | ------ |
| Exam Board | Selector |
| School | Selector |
| Key Stage | Selector |

#### Searches

| Name | Details |
| ------ | ------ |
| Name | Combined first and last name |
| Year Group |  |

## Teacher

### Columns

| Date Created | Name | Key Stage | Year Group | Exam Board |
| ------ | ------ | ------ | ----- | ------ |


### Fields and Values 

| Field Name | Values | Type | Validation | Error Messages |
| ------ | ------ | ------ | ------ | ------ |
| Name | | Drop Down | No validation except Max 200 characters | "A class name must be 200 characters or less" |
| Key Stage | | Drop Down | Constrained to drop down values, KS1, KS2, KS3, KS4, KS5, Foundation Stage |
| Year Group | | Text Numeric | No validation except Max 200 characters |"A year group must be 200 characters or less" |
| Number of Students | | Numeric | Max 9999, numbers only |
| Exam Board | | Constrained to Drop Down values |

### Filtering and Searching

#### Filters

| Name | Details |
| ------ | ------ |
| Exam Board | Selector |
| Key Stage | Selector |

#### Searches

| Name | Details |
| ------ | ------ |
| Name | Combined first and last name |
| Key Stage |  |
| Year Group |  |


#### Drop Down Values

| Field Name | Values |
| ------ | ------ |
| Exam Board | Edexcel |
| Exam Board | AQA |
| Exam Board | CCEA |
| Exam Board | CIE |
| Exam Board | ICAAE |
| Exam Board | OCR |
| Exam Board | WJEC |
| Exam Board | SQA |

| Field Name | Values |
| ------ | ------ |
| Key Stage | Foundation Stage |
| Key Stage | KS1 |
| Key Stage | KS2 |
| Key Stage | KS3 |
| Key Stage | KS4 |
| Key Stage | KS5 |

***

# Schools

Schools are the root object that owns classes and users - they represent the school bodies that teachers will create copies for.

## School Admin

### Columns

| Name | Level | Type | No of Students | City |
| ------ | ------ | ------ | ----- | ------ |


### Fields and Values 

| Field Name | Values | Type | Validation |
| ------ | ------ | ------ | ------ |
| Name | | Text Numeric | Max 200 Characters, prevent `¬|<>?:@~{}_+!"£$%^&*()*;#[]|`|
| Identifier | | Text Numeric | Max 100 characteers, Unconstrained|
| Address 1 | | Text Numeric | Max 200 Characters, prevent `¬|<>?:@~{}_+!"£$%^&*()*;#[]|`|
| Address 2 | | Text Numeric | Max 200 Characters, prevent `¬|<>?:@~{}_+!"£$%^&*()*;#[]|`|
| Town/City | | Text Numeric | Max 200 Characters, prevent `¬|<>?:@~{}_+!"£$%^&*()*;#[]|`|
| Post Code | | Text Numeric | Max 8 characters, only AlphaNumeric |
| Territory | | Drop Down | Constrained to dropdown values|
| Local Authority | | Text Numeric | Max 100 Characters, prevent `¬|\<>?:@~{}_+!"£$%^&*()/*,./;'#[]|`|
| School Level | |  Drop Down | Constrained to dropdown values |
| Type | | Drop Down | Constrained to dropdown values |
| Home Page | | Text Numeric | Unconstrained |
| Number of Students | | Numeric | Max 10 characters|


### Filtering and Searching

#### Filters

| Name | Details |
| ------ | ------ |
| Territory | Selector |
| Level | Selector |
| Type | Selector |
| Name | Selector |

#### Searches

| Name | Details |
| ------ | ------ |
| Identifier |  |
| Year Group |  |

## CLA Admin

### Columns

| Name | Level | Type | No of Students | City | School |
| ------ | ------ | ------ | ----- | ------ | ------ |


### Fields and Values 

| Field Name | Values | Type | Validation |
| ------ | ------ | ------ | ------ |
| Name | | Text Numeric | Max 200 Characters, prevent `¬|<>?:@~{}_+!"£$%^&*()*;#[]|`|
| Identifier | | Text Numeric | Max 100 characteers, Unconstrained|
| Address 1 | | Text Numeric | Max 200 Characters, prevent `¬|<>?:@~{}_+!"£$%^&*()*;#[]|`|
| Address 2 | | Text Numeric | Max 200 Characters, prevent `¬|<>?:@~{}_+!"£$%^&*()*;#[]|`|
| Town/City | | Text Numeric | Max 200 Characters, prevent `¬|<>?:@~{}_+!"£$%^&*()*;#[]|`|
| Post Code | | Text Numeric | Max 8 characters, only AlphaNumeric |
| Territory | | Drop Down | Constrained to dropdown values|
| Local Authority | | Text Numeric | Max 100 Characters, prevent `¬|\<>?:@~{}_+!"£$%^&*()/*,./;'#[]|`|
| School Level | |  Drop Down | Constrained to dropdown values |
| Type | | Drop Down | Constrained to dropdown values |
| Home Page | | Text Numeric | Unconstrained |
| Number of Students | | Numeric | Max 10 characters|


### Filtering and Searching

#### Filters

| Name | Details |
| ------ | ------ |
| Territory | Selector |
| Level | Selector |
| Type | Selector |
| Name | Selector |
| School | Selector |

#### Searches

| Name | Details |
| ------ | ------ |
| Identifier |  |
| Year Group |  |


#### Drop Down Values

| Field Name | Values |
| ------ | ------ |
| Territory | England |
| Territory | Guernsey |
| Territory | Jersey |
| Territory | Jersey |
| Territory | Isle of Man |
| Territory | Northern Ireland |
| Territory | Scotland |
| Territory | Wales |
| Level | Nursery |
| Level | First |
| Level | Primary |
| Level | Infant |
| Level | Junior |
| Level | Middle |
| Level | Secondary |
| Level | High |
| Level | Post 16 |
| Type | Academy |
| Type | College |
| Type | Free School |
| Type | Independent |
| Type | LA Maintained |
| Type | Special School |
| Type | Welsh School |
| Type | State FE |
| Type | Independent FE |
| Type | 6th Form |
| Type | General FE |
| Type | Land college |
| Type | Other |
