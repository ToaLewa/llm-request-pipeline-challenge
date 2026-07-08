Try to reduce code duplication by extracting shared behavior into small, focused utilities when it improves clarity.

When writing markdown plans, write them into the "plans" directory.

Query files within the db directory should not contain business logic or be aware of workflow ordering. The query files should only focus on data persistence and record retrieval. It should avoid having conditional logic. Business logic and conditional logic should be handled in the service layer instead.
