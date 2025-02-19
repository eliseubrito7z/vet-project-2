/* eslint-disable react/no-children-prop */
import {
  Avatar,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../services/apiClient'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '../../services/react-query'
import { AxiosError } from 'axios'
import { badGatewayFormatter } from '../../utils/errors/badGateway'
import { useContext } from 'react'
import { VetContext } from '../../context/VetContext'
import { StaffDetails } from '../../utils/@types/staffDetails'
import { roleFormatter } from '../../utils/roleFormatter'
import { Service } from '../../utils/@types/service'
import { statusFormatter } from '../../utils/statusFormatter'

const ServiceStatus = [
  'NOT_INITIALIZED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELED',
] as const

const updateServiceStatusSchema = z.object({
  status: z.enum(ServiceStatus),
})

type updateServiceStatusData = z.infer<typeof updateServiceStatusSchema>

interface UpdateServiceStatusModalProps {
  service: Service
}

export function UpdateServiceStatusModal({
  service,
}: UpdateServiceStatusModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<updateServiceStatusData>({
    resolver: zodResolver(updateServiceStatusSchema),
  })

  const toast = useToast()

  const updateServiceStatus = useMutation(
    async (status: updateServiceStatusData) => {
      await api.patch(`/api/services/v1/${service.id}`, null, {
        params: {
          ...status,
        },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service', service.id] })
        reset()
        toast({
          title: 'Status atualizado!',
          description: `O status foi atualizado!`,
          status: 'success',
          duration: 1500,
          isClosable: true,
        })
      },
      onError: (error: AxiosError<{ message: string }>) => {
        const errorMessage = badGatewayFormatter(error)
        toast({
          title: 'Status não atualizado',
          description: `Ocorreu um erro no envio do formulário ERROR: ${errorMessage}!`,
          status: 'error',
          duration: 2000,
          isClosable: true,
        })
      },
    },
  )

  async function handleUpdateStaffRole(status: updateServiceStatusData) {
    await updateServiceStatus.mutateAsync(status)
  }

  return (
    <>
      <Text
        p={2}
        as={'button'}
        bg="green.600"
        _hover={{ background: 'green.800' }}
        borderRadius={500}
        fontSize="0.75rem"
        fontWeight={600}
        color="white"
        onClick={onOpen}
      >
        Atualizar status
      </Text>

      <Modal
        size="sm"
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Atualizar status do atendimento</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(handleUpdateStaffRole)}>
            <ModalBody>
              <Select placeholder="Status" {...register('status')}>
                {ServiceStatus.map((status, index) => (
                  <option key={index} value={status}>
                    {statusFormatter(status)}
                  </option>
                ))}
              </Select>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                bg="green.600"
                _hover={{ background: 'green.800' }}
                color="white"
                type="submit"
                isLoading={isSubmitting || updateServiceStatus.isLoading}
              >
                Concluir
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
