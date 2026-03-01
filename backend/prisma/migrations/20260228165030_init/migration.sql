BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] NVARCHAR(1000) NOT NULL,
    [fullName] VARCHAR(150) NOT NULL,
    [birthDate] DATE NOT NULL,
    [landline] VARCHAR(20),
    [mobile] VARCHAR(20) NOT NULL,
    [email] VARCHAR(100) NOT NULL,
    [passwordHash] VARCHAR(255) NOT NULL,
    [address] VARCHAR(255) NOT NULL,
    [photo] VARCHAR(max),
    [isManager] BIT NOT NULL CONSTRAINT [Users_isManager_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Tasks] (
    [id] NVARCHAR(1000) NOT NULL,
    [managerId] NVARCHAR(1000) NOT NULL,
    [assigneeId] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [dueDate] DATE NOT NULL,
    [status] INT NOT NULL CONSTRAINT [Tasks_status_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tasks_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [completedAt] DATETIME2,
    CONSTRAINT [Tasks_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Tasks] ADD CONSTRAINT [Tasks_managerId_fkey] FOREIGN KEY ([managerId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Tasks] ADD CONSTRAINT [Tasks_assigneeId_fkey] FOREIGN KEY ([assigneeId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
