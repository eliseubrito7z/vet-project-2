import { HStack, Text, VStack } from '@chakra-ui/react'
import { nameFormatter } from '../../../utils/nameFormatter'
import { DutyButton } from '../../defaults/DutyButton'
import { NewPatientModal } from '../../Modals/NewPatientModal'
import { NewServiceModal } from '../../Modals/NewServiceModal'

interface HeaderProps {
  name: string
}

export function Header({ name }: HeaderProps) {
  return (
    <HStack w="100%" align="center" justify="space-between" mb="1.75rem">
      <VStack align="start">
        <Text
          fontWeight={600}
          fontSize="1.5rem"
          color="green.900"
          lineHeight={1}
        >
          Bem-vindo(a) novamente {nameFormatter(name)}
        </Text>

        <Text
          fontWeight={600}
          fontSize="0.75rem"
          color="gray.200"
          lineHeight={1}
          sx={{ span: { color: 'green.600' } }}
        >
          Sua clinica está trabalhando no modo: <span>Normal</span>
        </Text>
      </VStack>
      <HStack>
        <DutyButton />
        <NewServiceModal />
        <NewPatientModal />
      </HStack>
    </HStack>
  )
}
