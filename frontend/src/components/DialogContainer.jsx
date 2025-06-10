// 6. DialogContainer.jsx - Container for all dialogs
'use client';

import { Dialog } from '@/components/ui/dialog';
import CreateUser from './CreateUser';
import CreateGroupDialog from './GroupDialogue';

export default function DialogContainer({
  dialogOpen,
  setDialogOpen,
  createGroupOpen,
  setCreateGroupOpen,
  socket,
  newUsername,
  setNewUsername,
  newPassword,
  setNewPassword,
  isEditMode,
  setIsEditMode,
  userToEdit,
  setUserToEdit,
  users,
  username,
  isGroupEditMode,
  setIsGroupEditMode,
  groupToEdit,
  setGroupToEdit
}) {
  return (
    <>
      {/* Create User Dialog */}
      <Dialog 
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) {
            setIsEditMode(false);
            setUserToEdit(null);
          }
        }}
      >
        <CreateUser
          socket={socket}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          isEditMode={isEditMode}
          userToEdit={userToEdit}
          setIsEditMode={setIsEditMode}
          setUserToEdit={setUserToEdit}
        />
      </Dialog>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        users={users}
        socket={socket}
        username={username}
        isEdit={isGroupEditMode}
        setIsGroupEditMode={setIsGroupEditMode}
        groupToEdit={groupToEdit}
        setGroupToEdit={setGroupToEdit}
      />
    </>
  );
}
